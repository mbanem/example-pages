
  // CRAppTypes from schema.prisma
  export type Role = 'USER' | 'ADMIN' | 'VISITOR' | 'MODERATOR';
  
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

  // Copy this import to CRUD +page.svelte files
  // import type { User, Role, Profile, Article, Post, Category, Todo }  from '$lib/types/types';
  
export type  UserPartial = {
    email: string | null;
    firstName: string | null;
    id: string | null;
    lastName: string | null;
		password: string | null;
    role: Role | null;
    updatedAt: Date | null;
};
export type  ProfilePartial = {
    bio: string | null;
    id: string | null;
    updatedAt: Date | null;
    userId: string | null;
};
export type  ArticlePartial = {
    authorId: string | null;
    content: string | null;
    id: string | null;
    title: string | null;
};
export type  PostPartial = {
    authorId: string | null;
    content: string | null;
    id: string | null;
    published: boolean | null;
    title: string | null;
    updatedAt: Date | null;
};
export type  CategoryPartial = {
    id: number | null;
    name: string | null;
};
export type  TodoPartial = {
    completed: boolean | null;
    content: string | null;
    id: string | null;
    priority: number | null;
    title: string | null;
    updatedAt: Date | null;
    userId: string | null;
};

export type TCRInput = typeof CRInput;
export type TCRActivity = typeof CRActivity;
export type TCRTooltip = typeof CRTooltip;
export type TCRSpinner = typeof CRSpinner;
export type TCRSummaryDetail = typeof CRSummaryDetail;
export interface IStringBoolean {
  [key: string]: boolean;
}
  