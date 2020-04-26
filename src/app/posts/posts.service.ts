import { Post } from './post.model';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class PostsService {
    private postsUpdated = new Subject<Post[]>();
    private posts: Post[] = [];

    constructor(private http: HttpClient) {}

    getPosts() {
        this.http.get<{message: string, posts: any}>('http://localhost:3000/api/posts')
        .pipe(map(postData => {
            return postData.posts.map(post => {
                return {
                    title: post.title,
                    content: post.content,
                    id: post._id
                };
            });
        }))
        .subscribe((transformedPostData) => {
            this.posts = transformedPostData;
            this.postsUpdated.next([...this.posts]);
        });
    }

    getPostUpdateListener() {
        return this.postsUpdated.asObservable();
    }

    getPost(id: string) {
        return {...this.posts.find(p => p.id === id)};
    }

    updatePost(id: string, title: string, content: string) {
        const post: Post = {
            id,
            title,
            content
        };

        this.http.put('http://localhost:3000/api/posts/' + id, post)
        .subscribe(response => {
            console.log(response);
        });
    }

    addPost(title: string, content: string) {
        const post = {id: null, title, content};

        this.http.post<{message: string}>('http://localhost:3000/api/posts', post)
        .subscribe((responseData) => {
            console.log(responseData.message);
            this.posts.push(post);
            this.postsUpdated.next([...this.posts]);
        });
    }

    deletePost(id: string) {
        this.http.delete('http://localhost:3000/api/posts/' + id)
        .subscribe(() => {
            const updatedPosts = this.posts.filter(post => post.id !== id);
            this.posts = updatedPosts;
            this.postsUpdated.next([...this.posts]);
        });
    }
}

