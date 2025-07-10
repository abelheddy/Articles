package com.rcs.blue_app.data.model

import com.google.gson.annotations.SerializedName

data class Article(
    @SerializedName("id") val id: Int,
    @SerializedName("nombre") val name: String,
    @SerializedName("descripcion") val description: String,
    @SerializedName("price") val price: Double,
    @SerializedName("images") val images: List<Image> = emptyList()
)

data class Image(
    @SerializedName("id") val id: Int,
    @SerializedName("url") val url: String,
    @SerializedName("imageable_type") val imageableType: String,
    @SerializedName("imageable_id") val imageableId: Int
)
