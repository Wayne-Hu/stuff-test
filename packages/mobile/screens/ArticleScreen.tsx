import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useLayoutEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { FeedStackParamList } from '../types/navigation';
import { useReadLater } from '@read-later/shared';

type Props = NativeStackScreenProps<FeedStackParamList, 'Article'>;

export default function ArticleScreen({ route, navigation }: Props) {
  const { article } = route.params;
  const { isSaved, toggle } = useReadLater();
  const saved = isSaved(article.id);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => toggle(article.id)} hitSlop={8}>
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={24} color="#0066cc" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, saved, article.id, toggle]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {article.imageUrl ? (
        <Image source={{ uri: article.imageUrl }} style={styles.image} />
      ) : null}
      <View style={styles.body}>
        <Text style={styles.section}>{article.section.toUpperCase()}</Text>
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.date}>
          {new Date(article.publishedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
        <Text style={styles.summary}>{article.summary}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 40 },
  image: { width: '100%', height: 240 },
  body: { padding: 16 },
  section: { fontSize: 11, fontWeight: '700', color: '#0066cc', letterSpacing: 0.5, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#111', lineHeight: 30, marginBottom: 8 },
  date: { fontSize: 13, color: '#888', marginBottom: 16 },
  summary: { fontSize: 16, color: '#333', lineHeight: 26 },
});
