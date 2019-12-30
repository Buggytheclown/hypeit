import { HabrResourses } from '../../postGrabbers/habr/habrPostGrabber.service';
import { MediumResourses } from '../../postGrabbers/medium/mediumPostGrabber.service';
import { DevtoResourses } from '../../postGrabbers/devto/devtoPostGrabber.service';

export type PostResourcesData = HabrResourses | MediumResourses | DevtoResourses;
