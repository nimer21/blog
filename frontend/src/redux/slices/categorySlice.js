import { createSlice } from "@reduxjs/toolkit";

const categorySlice = createSlice({
    name: "category",
    initialState: {
        categories: [],
    },
    reducers: {
        setCategories(state,action) {
            state.categories = action.payload;
        },
        addCategory(state, action) {
            state.categories.push(action.payload);
        },
        deleteCategory(state, action) {
            // Using filter instead of splice to prevent mutation
            state.categories = state.categories.filter(c => c._id !== action.payload);       
            
            /*
            const index = state.categories.findIndex((c) => c._id === action.payload);
            if(index >= 0) {
                state.categories.splice(index, 1);
            }*/
        },
    }

});

const categoryReducer = categorySlice.reducer;
const categoryActions = categorySlice.actions;

export { categoryReducer, categoryActions}