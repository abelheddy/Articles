package com.rcs.blue_app.network

import com.rcs.blue_app.data.model.Article
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @GET("articles")
    suspend fun getArticles(): Response<List<Article>>

    @POST("articles")
    suspend fun createArticle(@Body article: Article): Response<Article>

    @Multipart
    @POST("articles/{id}/upload-images")
    suspend fun uploadArticleImages(
        @Path("id") articleId: Int,
        @Part images: List<MultipartBody.Part>
    ): Response<Article>

    @POST("articles/{id}/images")
    suspend fun addArticleImages(
        @Path("id") articleId: Int,
        @Body images: List<ImageRequest>
    ): Response<Article>
}

data class ImageRequest(
    val url: String,
    val type: String // "URL" o "DEVICE"
)