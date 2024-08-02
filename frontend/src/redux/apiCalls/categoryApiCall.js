import { categoryActions } from "../slices/categorySlice";
import request from "../../utils/request";
import { toast } from "react-toastify";

// Fetch All Categories
export function fetchCategories() {
  return async (dispatch) => {
    try {
      const { data } = await request.get("/api/categories");
      dispatch(categoryActions.setCategories(data));
    } catch (err) {
      toast.error(err.response.data.message);
      //console.error(err);
    }
  };
}

// Create Category
export function createCategory(newCategory) {
  return async (dispatch, getState) => {
    try {
      const { data } = await request.post("/api/categories",newCategory, {
        headers: {
          Authorization: "Bearer " +getState().auth.user.token,
          //Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      dispatch(categoryActions.addCategory(data));
      toast.success("Category created successfully!");
    } catch (err) {
      toast.error(err.response.data.message);
      //console.error(err);
    }
  };
}

// Delete Category
export function deleteCategory(categoryId) {
  return async (dispatch, getState) => {
    try {
      const { data } = await request.delete(`/api/categories/${categoryId}`, {
        headers: {
          Authorization: "Bearer " +getState().auth.user.token,
          //Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      dispatch(categoryActions.deleteCategory(data.categoryId));
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response.data.message);
      //console.error(err);
    }
  };
}