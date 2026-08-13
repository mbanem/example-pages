export const lowercaseTypes = `
  export type User = {
  articles: Article[];
  createdAt: Date;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  passwordHash: string;
  posts: Post[];
  profile: Profile;
  role: Role;
  todos: Todo[];
  updatedAt: Date;
  userAuthToken: string;
  };

  export type Profile = {
  bio: string;
  createdAt: Date;
  id: string;
  updatedAt: Date;
  user: User;
  userId: string;
  };

  export type Article = {
  author: User;
  authorId: string;
  content: string;
  id: string;
  title: string;
  };

  export type Post = {
  author: User;
  authorId: string;
  categories: Category[];
  content: string;
  createdAt: Date;
  id: string;
  published: boolean;
  title: string;
  updatedAt: Date;
  };

  export type Category = {
  id: number;
  name: string;
  posts: Post[];
  };

  export type Todo = {
  completed: boolean;
  content: string;
  createdAt: Date;
  id: string;
  priority: number;
  title: string;
  updatedAt: Date;
  user: User;
  userId: string;
  };
;`;