import RegitserForm from "./RegitserForm";

function Register() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center py-6 sm:py-10 px-3 sm:px-6 w-full">
      <h1 className="text-main-color text-3xl sm:text-4xl text-center font-bold mb-2 sm:mb-4">
        Register
      </h1>
      <RegitserForm />
    </div>
  );
}

export default Register;
