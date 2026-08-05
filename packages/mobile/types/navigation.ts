import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Article } from '@read-later/shared';

export type FeedStackParamList = {
  FeedList: undefined;
  Article: { article: Article };
};

export type RootTabParamList = {
  Feed: NavigatorScreenParams<FeedStackParamList>;
  ReadLater: undefined;
};
