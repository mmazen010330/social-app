import LoginForm from "./LoginForm";

function Login() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center py-10 px-4">
      <h1 className="text-main-color text-5xl text-center font-bold mb-4">
        Login
      </h1>
      <LoginForm />
    </div>
  );
}

export default Login;
