import axios from "axios";

async function addUser(user: any): Promise<void> {
  try {
    const response = await axios.post("http://localhost:3000/auth/register", {
      user,
    });

    console.log("User added:", response.data);
  } catch (error) {
    console.error("Failed to add user:", error);
    throw error;
  }
}

const newUser = {
  username: "newUser123",
  password: "securehash",
  firstName: "John",
  lastName: "Doe",
  clockId: 101,
};

addUser(newUser).then(() => console.log("Add user operation completed."));
