package com.rcs.blue_app.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rcs.blue_app.data.model.Article
import com.rcs.blue_app.data.model.ImageToUpload
import com.rcs.blue_app.extensions.toMultipartBody
import com.rcs.blue_app.network.ImageRequest
import com.rcs.blue_app.repository.ArticleRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CreateArticleViewModel @Inject constructor(
    private val repository: ArticleRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<CreateArticleUiState>(CreateArticleUiState.Idle)
    val uiState: StateFlow<CreateArticleUiState> = _uiState.asStateFlow()

    private val _selectedImages = MutableStateFlow<List<ImageToUpload>>(emptyList())
    val selectedImages: StateFlow<List<ImageToUpload>> = _selectedImages.asStateFlow()

    fun createArticle(article: Article) {
        viewModelScope.launch {
            _uiState.value = CreateArticleUiState.Loading
            val result = repository.createArticle(article)
            _uiState.value = when {
                result.isSuccess -> CreateArticleUiState.Success(result.getOrNull()!!)
                else -> CreateArticleUiState.Error(result.exceptionOrNull()?.message ?: "Error desconocido")
            }
        }
    }

    suspend fun uploadAllImages(articleId: Int, context: Context): Boolean {
        return try {
            // Subir imágenes desde URL
            val urlImages = _selectedImages.value.filter { it.type == "URL" }
            if (urlImages.isNotEmpty()) {
                val result = repository.addArticleImages(
                    articleId,
                    urlImages.map { ImageRequest(it.uri, "URL") }
                )
                if (result.isFailure) return false
            }

            // Subir imágenes desde dispositivo
            val deviceImages = _selectedImages.value.filter { it.type == "DEVICE" }
            if (deviceImages.isNotEmpty()) {
                val multipartImages = deviceImages.mapNotNull { image ->
                    image.localUri?.toMultipartBody(context, "images")
                }

                val result = repository.uploadArticleImages(articleId, multipartImages)
                if (result.isFailure) return false
            }

            true
        } catch (e: Exception) {
            false
        }
    }

    fun addImage(image: ImageToUpload) {
        _selectedImages.value = _selectedImages.value + image
    }

    fun removeImage(index: Int) {
        _selectedImages.value = _selectedImages.value.toMutableList().apply {
            removeAt(index)
        }
    }
}

sealed interface CreateArticleUiState {
    data object Idle : CreateArticleUiState
    data object Loading : CreateArticleUiState
    data class Success(val article: Article) : CreateArticleUiState
    data class Error(val message: String) : CreateArticleUiState
}