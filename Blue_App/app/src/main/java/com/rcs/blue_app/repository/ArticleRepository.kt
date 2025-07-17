package com.rcs.blue_app.repository

import com.rcs.blue_app.data.model.Article
import com.rcs.blue_app.network.ImageRequest
import com.rcs.blue_app.network.RetrofitInstance
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MultipartBody
import javax.inject.Inject

class ArticleRepository @Inject constructor() {
    suspend fun getArticles(): List<Article> {
        return withContext(Dispatchers.IO) {
            try {
                val response = RetrofitInstance.api.getArticles()
                if (response.isSuccessful) {
                    response.body() ?: emptyList()
                } else {
                    emptyList()
                }
            } catch (e: Exception) {
                emptyList()
            }
        }
    }

    suspend fun createArticle(article: Article): Result<Article> {
        return withContext(Dispatchers.IO) {
            try {
                val response = RetrofitInstance.api.createArticle(article)
                if (response.isSuccessful) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception(response.errorBody()?.string() ?: "Error desconocido"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    suspend fun addArticleImages(
        articleId: Int,
        images: List<ImageRequest>
    ): Result<Article> {
        return withContext(Dispatchers.IO) {
            try {
                val response = RetrofitInstance.api.addArticleImages(articleId, images)
                if (response.isSuccessful) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception(response.errorBody()?.string() ?: "Error al agregar imágenes"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    suspend fun uploadArticleImages(
        articleId: Int,
        images: List<MultipartBody.Part>
    ): Result<Article> {
        return withContext(Dispatchers.IO) {
            try {
                val response = RetrofitInstance.api.uploadArticleImages(articleId, images)
                if (response.isSuccessful) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception(response.errorBody()?.string() ?: "Error al subir imágenes"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
}