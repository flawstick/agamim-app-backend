import axios from "axios";

async function login(credentials: any): Promise<void> {
  try {
    const response = await axios.post(
      "http://ec2-51-17-228-147.il-central-1.compute.amazonaws.com:3000/auth/login",
      {
        credentials,
      },
    );

    console.log("User added:", response.data);
  } catch (error) {
    console.error("Failed to add user:", error);
    throw error;
  }
}

login({ username: "Jhon", password: "securehash" }).then(() =>
  console.log("Add user operation completed."),
);
