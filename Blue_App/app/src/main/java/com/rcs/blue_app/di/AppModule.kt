package com.rcs.blue_app.di

import com.rcs.blue_app.repository.ArticleRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideArticleRepository(): ArticleRepository {
        return ArticleRepository()
    }


}