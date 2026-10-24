import {

  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "iconsax-reactjs";
import {  useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { loginSchema } from "./login.zod";
import type { LoginUserDataType } from "./login.interface";
import { userLogin } from "./login.services";
import AppButton from "../../SharedComponet/AppButton/AppButton";
import { useContext } from "react";
import { UserAuthContext } from "../../Context/UserAuthProvider/UserAuthProvider";

// schema


function LoginForm() {

  const {
    handleSubmit,
    register,
    formState: { errors , isSubmitting},
    reset
    
  } = useForm({
    defaultValues: {
     
      email: "",
    
      password: "",
    },
    mode: "all",
    resolver: zodResolver(loginSchema)
  });

  // console.log(rhfObject.handleSubmit())

  // console.log()

  const router =  useNavigate()

  const {setUserData} = useContext(UserAuthContext)


  function sendUserData(data:LoginUserDataType) {
    toast.promise(userLogin(data), {
      loading: "Please While Registering",
      success: function(data) {
        // console.log(data)

        localStorage.setItem('user_tkn', data.data.token)

        setUserData(data.data.user)

        reset()
        router('/')
        return <h1 className="text-emerald-500 capitalize">{data.message}</h1>
      },
      error: data => <h1 className="text-red-500 capitalize">{data.message}</h1>
    })


  
  }
 

  // formik   react-hook-form
  return (
    <Form
      onSubmit={handleSubmit(sendUserData)}
      className="flex w-full max-w-md flex-col gap-4 bg-white p-6 sm:p-10 my-4 sm:my-8 rounded-2xl sm:rounded-3xl shadow-xl"
    >

      
      {/* Name Input */}
      
      {/* Name Input */}

      {/* User Name Input */}


      {/* Email Input */}

      <TextField isRequired type="email" isInvalid={!!errors.email}>
        <Label>Email</Label>
        <Input
          {...register("email")}
          className="focus:ring-main-color"
          placeholder="Write Your Email"
          autoComplete="off"
        />
        {/* <Input
          {...register("email", {
            required: {value: true, message: "Email is Required"}, 
            pattern: {value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, message: "Enter Valid Email"},
          })}
          className="focus:ring-main-color"
          placeholder="Write Your Email"
        /> */}
        <FieldError />
      </TextField>

      {errors.email && <span className="text-red-500 text-xs">{errors.email?.message}</span>}
      

      {/* Email Input */}

      {/* Password Input */}

      <TextField isRequired type="password" isInvalid={!!errors.password}>
        <Label>Password</Label>
        <Input
          {...register("password")}
          className="focus:ring-main-color"
          placeholder="Enter your password"
          autoComplete="off"
        />
        {/* <Input
          {...register("password",  {
            required: {value: true, message: "Password is Required"}, 
            pattern: {value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, message: "Enter Valid Password"},
          })}
          className="focus:ring-main-color"
          placeholder="Enter your password"
        /> */}
        <FieldError />
      </TextField>

      {errors.password && <span className="text-red-500 text-xs">{errors.password?.message}</span>}


      {/* Password Input */}

      {/* Confirm Password Input */}


      <div className="flex gap-2 flex-col">
        {/* <Button 
        isDisabled={isSubmitting}
          className="w-full bg-main-color hover:bg-main-color/80"
          type="submit"
        >
          <Check />
          Login
        </Button> */}
        <AppButton  isDisabled={isSubmitting}
          className="w-full bg-main-color hover:bg-main-color/80"
          type="submit"
        
          ><Check />
          Login</AppButton>
        {/* <Button className="w-full" type="reset" variant="danger">
          Reset
        </Button> */}
      <AppButton className="w-full" type="reset" variant="danger">Reset</AppButton>
      </div>
    </Form>
  );
}

export default LoginForm;
