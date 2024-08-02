import "./verify-email.css";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from 'react';
import { verifyEmail } from "../../redux/apiCalls/authApiCalls";

const VerifyEmail = () => {
  //const isEmailVerified = true;
  const dispatch = useDispatch();
  const { isEmailVerified } = useSelector(state => state.auth);
  console.log(isEmailVerified); //false


  const { userId, token } = useParams();

  useEffect(() => {
    dispatch(verifyEmail(userId,token));
  },[userId, token]);
  return (
    <section className="verify-email">
      {isEmailVerified ? (
        <>
          <i className="bi bi-patch-check verifiy-email-icon"></i>
          <h1 className="verify-email-title">
            Your email has been successfully verified
          </h1>
          <Link to="/login" className="verify-email-link">
            Go To Login Page
          </Link>
        </>
      ) : (
        <>
          <h1 className="verify-email-not-found">Not Found</h1>
        </>
      )}
    </section>
  );
};

export default VerifyEmail;
