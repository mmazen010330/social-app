import {
  FieldError,
  Form,
  Input,
  Label,
  TextField,
  ListBox,
  Select,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "iconsax-reactjs";
import { Controller, useForm } from "react-hook-form";
import { userRegister } from "./register.services";
import { registerSchema } from "./register.zod";
import type { UserDataType } from "./register.interface";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import AppButton from "../../SharedComponet/AppButton/AppButton";

// schema


function RegitserForm() {

  const {
    handleSubmit,
    register,
    formState: { errors , isSubmitting},
    control,
    
  } = useForm<UserDataType>({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      dateOfBirth: "",
      gender: "male",
      password: "",
      rePassword: "",
    },
    mode: "all",
    resolver: zodResolver(registerSchema)
  });

  // console.log(rhfObject.handleSubmit())

  // console.log()

  const router =  useNavigate()


  function sendUserData(data:UserDataType) {
    toast.promise(userRegister(data), {
      loading: "Please wait while registering",
      success: function(data) {
        router('/login')
        return <h1 className="text-emerald-500 capitalize">{data}</h1>
      },
      error: (err) => {
        const message = err instanceof Error ? err.message : "Registration failed";
        return <h1 className="text-red-500 capitalize">{message}</h1>;
      },
    })
  }
 

  // formik   react-hook-form
  return (
    <Form
      onSubmit={handleSubmit(sendUserData)}
      className="flex w-full max-w-lg flex-col gap-4 bg-white p-5 sm:p-10 my-4 sm:my-8 rounded-2xl sm:rounded-3xl shadow-xl"
    >

      
      {/* Name Input */}
      <TextField isRequired type="text" isInvalid={!!errors.name}>
        <Label>Name</Label>
        <Input
        
          {...register("name")}

          className="focus:ring-main-color"
          placeholder="Write Your Name"
        />
        {/* <Input
        
          {...register("name", {
            required: {value: true, message: "Name is Required"}, 
            pattern: {value: /([a-zA-Z0-9_\s]+)/, message: "Enter Valid Name"},
          })}

          className="focus:ring-main-color"
          placeholder="Write Your Name"
        /> */}
        <FieldError />
      </TextField>

      {errors.name && <span className="text-red-500 text-xs">{errors.name?.message}</span>}
      
      {/* Name Input */}

      {/* User Name Input */}

      <TextField isRequired type="text" isInvalid={!!errors.username}>
        <Label>User Name</Label>
        <Input
          {...register("username")}
          className="focus:ring-main-color"
          placeholder="Write Your User Name"
        />
        {/* <Input
          {...register("username", {
            required: {value: true, message: "User Name is Required"}, 
            pattern: {value: /^[a-zA-Z0-9_-]{3,16}$/, message: "Enter Valid User Name"},
          })}
          className="focus:ring-main-color"
          placeholder="Write Your User Name"
        /> */}
        <FieldError />
      </TextField>
      {errors.username && <span className="text-red-500 text-xs">{errors.username?.message}</span>}
      
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

      <TextField isRequired type="password" isInvalid={!!errors.rePassword}> 
        <Label>Confirm Password</Label>
        <Input
          {...register("rePassword")}
          className="focus:ring-main-color"
          placeholder="Enter your Confirm Password"
          autoComplete="off"
        />
        {/* <Input
          {...register("rePassword",  {
            required: {value: true, message: "Confirm Password is Required"}, 
            // pattern: {value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, message: "Enter Valid Confirm Password"},
            validate: function(value) {
              if(value === watch("password")) {
                return true;
              }

              return "Password & Confirm Password Should Be Same"
            }
          })}
          className="focus:ring-main-color"
          placeholder="Enter your Confirm Password"
        /> */}
        <FieldError />
      </TextField>
      {errors.rePassword && <span className="text-red-500 text-xs">{errors.rePassword?.message}</span>}


      {/* Password Input */}

      {/* Birth Input */}

{/* yyyy-mm-dd => \d{4}-\d{2}-\d{2} */}
      <TextField isRequired type="date" isInvalid={!!errors.dateOfBirth}>
        <Label>Birth </Label>
        <Input
          {...register("dateOfBirth")}
          className="focus:ring-main-color"
          placeholder="Enter your DATE of Birth"
        />
        {/* <Input
          {...register("dateOfBirth",  {
            required: {value: true, message: "Password is Required"}, 
            // valueAsDate:true
            validate: function(value) {
              const userData = new Date(value)
              const currentYear =  new Date();

              if(currentYear.getFullYear() - userData.getFullYear() > 20) {
                return true
              }
              return "Your Age Must Be Above 20 Years Old"
            },
          })}
          className="focus:ring-main-color"
          placeholder="Enter your DATE of Birth"
        /> */}
        {/* <Input
          {...register("dateOfBirth")}
          className="focus:ring-main-color"
          placeholder="Enter your DATE of Birth"
        /> */}
        {/* <Input
          {...register("dateOfBirth",  {
            required: {value: true, message: "Password is Required"}, 
            // valueAsDate:true
            validate: function(value) {
              const userData = new Date(value)
              const currentYear =  new Date();

              if(currentYear.getFullYear() - userData.getFullYear() > 20) {
                return true
              }
              return "Your Age Must Be Above 20 Years Old"
            },
          })}
          className="focus:ring-main-color"
          placeholder="Enter your DATE of Birth"
        /> */}
        <FieldError />
      </TextField>

      {errors.dateOfBirth && <span className="text-red-500 text-xs">{errors.dateOfBirth?.message}</span>}

      {/* Birth Input */}

     <Controller name="gender" control={control} render={function({field}) {
      // console.log(x);
      return  <Select {...field} className="" placeholder="Select one" isInvalid={!!errors.gender}>
        <Label>State</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="male" textValue="male">
              Male
              <ListBox.ItemIndicator />
            </ListBox.Item>
            <ListBox.Item id="female" textValue="female">
              Female
              <ListBox.ItemIndicator />
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
              {errors.gender && <span className="text-red-500 text-xs">{errors.gender?.message}</span>}

      </Select>
     }}/>

      <div className="flex gap-2 flex-col">
        {/* <Button 
        isDisabled={isSubmitting}
          className="w-full bg-main-color hover:bg-main-color/80"
          type="submit"
        >
          <Check />
          Submit
        </Button> */}
        <AppButton isDisabled={isSubmitting} className="w-full bg-main-color hover:bg-main-color/80"
          type="submit"><Check />
          Sign up</AppButton>


        <AppButton className="w-full" type="reset" variant="danger">
          Reset
        </AppButton>
      </div>
    </Form>
  );
}

export default RegitserForm;
