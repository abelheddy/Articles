package com.rcs.blue_app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rcs.blue_app.data.model.Article
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
}

sealed interface CreateArticleUiState {
    data object Idle : CreateArticleUiState
    data object Loading : CreateArticleUiState
    data class Success(val article: Article) : CreateArticleUiState
    data class Error(val message: String) : CreateArticleUiState
}