/**
 * Supported blog topics.
 */
export enum BlogTopic {
  technology = 'Technology',
  business = 'Business',
  programming = 'Programming',
  entertainment = 'Entertainment',
}

/**
 * Creates one `BlogTopic` from its serialized enum-name value.
 */
export function blogTopicFromValue(name: string): BlogTopic {
  const topic = (Object.keys(BlogTopic) as Array<keyof typeof BlogTopic>).find(
    (currentTopic) => currentTopic === name,
  );

  if (topic === undefined) {
    throw new Error(`Unknown blog topic: ${name}`);
  }

  return BlogTopic[topic];
}
