/**
 * Supported blog topics.
 */
export enum BlogTopic {
  technology = 'technology',
  business = 'business',
  programming = 'programming',
  entertainment = 'entertainment',
}

/**
 * Human-readable labels associated with each backend-facing blog topic value.
 */
export const blogTopicLabels: Record<BlogTopic, string> = {
  [BlogTopic.technology]: 'Technology',
  [BlogTopic.business]: 'Business',
  [BlogTopic.programming]: 'Programming',
  [BlogTopic.entertainment]: 'Entertainment',
};

/**
 * Creates one `BlogTopic` from its serialized backend value.
 */
export function fromValue(name: string): BlogTopic {
  if (!(Object.values(BlogTopic) as ReadonlyArray<string>).includes(name)) {
    throw new Error(`Unknown blog topic: ${name}`);
  }

  return name as BlogTopic;
}
