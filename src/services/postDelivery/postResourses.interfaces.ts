import { HabrResourses } from '../../postGrabbers/habr/habrPostGrabber.service';
import { MediumResourses } from '../../postGrabbers/medium/mediumPostGrabber.service';

export type PostResourcesData = HabrResourses | MediumResourses;
