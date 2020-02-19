import { Injectable } from '@nestjs/common';
import { HabrPostGrabberService } from '../../postGrabbers/habr/habrPostGrabber.service';
import { PostModel } from '../../db/postModel.service';
import { MediumPostGrabberService } from '../../postGrabbers/medium/mediumPostGrabber.service';
import { DevtoPostGrabberService } from '../../postGrabbers/devto/devtoPostGrabber.service';
import { merge, Observable, Subject } from 'rxjs';
import { PostResources } from './post.interfaces';
import { PostResourcesData } from './postResourses.interfaces';
import { exhaustiveCheck } from '../../helpers/helpers';

enum PostDeliveryStates {
  STARTED = 'STARTED',
  PARSED = 'PARSED',
  SAVED = 'SAVED',
}

enum PostDeliveryPeriod {
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

interface PostDeliveryEvent {
  state: PostDeliveryStates;
  count?: number;
  resource: PostResources;
}

const postDeliveryEventCreators = {
  started({ resource }: { resource: PostResources }): PostDeliveryEvent {
    return {
      state: PostDeliveryStates.STARTED,
      resource,
    };
  },
  parsed({
    count,
    resource,
  }: {
    count: number;
    resource: PostResources;
  }): PostDeliveryEvent {
    return {
      state: PostDeliveryStates.PARSED,
      resource,
      count,
    };
  },
  saved({
    count,
    resource,
  }: {
    count: number;
    resource: PostResources;
  }): PostDeliveryEvent {
    return {
      state: PostDeliveryStates.SAVED,
      resource,
      count,
    };
  },
};

function combineGrabberModel({
  producer,
  consumer,
  resource,
}: {
  producer: () => Promise<PostResourcesData>;
  consumer: (res: PostResourcesData) => Promise<{ savedCount: number }>;
  resource: PostResources;
}): Observable<PostDeliveryEvent> {
  return new Observable(observer => {
    observer.next(
      postDeliveryEventCreators.started({
        resource,
      }),
    );

    producer()
      .then(producedResult => {
        observer.next(
          postDeliveryEventCreators.parsed({
            count: producedResult.posts.length,
            resource,
          }),
        );
        return consumer(producedResult);
      })
      .then(data => {
        observer.next(
          postDeliveryEventCreators.saved({ count: data.savedCount, resource }),
        );
        observer.complete();
      });
  });
}

@Injectable()
export class PostDeliveryService {
  period = PostDeliveryPeriod;

  constructor(
    private readonly habrPostGrabberService: HabrPostGrabberService,
    private readonly mediumPostGrabberService: MediumPostGrabberService,
    private readonly devtoPostGrabberService: DevtoPostGrabberService,
    private readonly postModel: PostModel,
  ) {}

  updatePosts({
    resource,
    period,
  }: {
    resource?: PostResources;
    period: PostDeliveryPeriod;
  }): Observable<PostDeliveryEvent> {
    return merge(
      ...this.getResourceProducerService(resource).map(producerService =>
        combineGrabberModel({
          producer: producerService[getResourcePeriodMethod(period)],
          consumer: this.postModel.savePosts,
          resource: producerService.resource,
        }),
      ),
    );
  }

  private getResourceProducerService(resource?: PostResources) {
    if (!resource) {
      return [
        this.devtoPostGrabberService,
        this.mediumPostGrabberService,
        this.habrPostGrabberService,
      ];
    }
    if (resource === PostResources.DEVTO) {
      return [this.devtoPostGrabberService];
    }
    if (resource === PostResources.MEDIUM) {
      return [this.mediumPostGrabberService];
    }
    if (resource === PostResources.HABR) {
      return [this.habrPostGrabberService];
    }
    exhaustiveCheck(resource);
  }
}

function getResourcePeriodMethod(
  period: PostDeliveryPeriod,
): 'getBestOfTheWeek' | 'getBestOfTheMonth' {
  if (period === PostDeliveryPeriod.WEEK) {
    return 'getBestOfTheWeek';
  } else if (period === PostDeliveryPeriod.MONTH) {
    return 'getBestOfTheMonth';
  } else {
    exhaustiveCheck(period);
  }
}
