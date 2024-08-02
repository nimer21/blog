import { passwordActions } from "../slices/passwordSlice";
import request from "../../utils/request";
import { toast } from "react-toastify";

// Forgot Password
export function forgotPassword(email) {
  return async () => {
    try {
      const { data } = await request.post("/api/password/reset-password-link", {
        email: email,
      });
      toast.success(data.message); // "Reset password link sent successfully!"
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };
}

// Get Reset Password
export function getResetPassword(userId, token) {
  return async (dispatch) => {
    try {
      await request.get(`/api/password/reset-password/${userId}/${token}`);
    } catch (err) {
      console.log(err);
      dispatch(passwordActions.setError());
    }
  };
}

// Reset The Password
export function resetPassword(newPassword, user) {
  return async () => {
    try {
      const { data } = await request.post(
        `/api/password/reset-password/${user.userId}/${user.token}`,
        { password: newPassword }
      );
      toast.success(data.message); // "Password reset successfully!"
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };
}
