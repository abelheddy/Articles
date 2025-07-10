package com.rcs.blue_app.network

import com.rcs.blue_app.data.model.Article
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @GET("articles")
    suspend fun getArticles(): Response<List<Article>>

    @POST("articles")
    suspend fun createArticle(@Body article: Article): Response<Article>
}