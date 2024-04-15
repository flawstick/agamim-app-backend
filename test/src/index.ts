import axios from "axios";

interface User {
  uuid: string;
  username: string;
  hashedPassword: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  lastLogin: string;
  clockId: number;
  hoursWorked: number;
  shifts?: any[];
  settings?: any;
}

async function addUser(user: User): Promise<void> {
  try {
    const response = await axios.post("http://locathost:3000", {
      username: user.username,
      hashedPassword: user.hashedPassword,
      firstName: user.firstName,
      lastName: user.lastName,
      clockId: user.clockId,
    });

    console.log("User added:", response.data);
  } catch (error) {
    console.error("Failed to add user:", error);
  }
}

const newUser: User = {
  uuid: "123-abc",
  username: "newUser123",
  hashedPassword: "securehash",
  firstName: "John",
  lastName: "Doe",
  lastLogin: "2024-04-12T08:00:00Z",
  clockId: 101,
  hoursWorked: 40,
};

addUser(newUser).then(() => console.log("Add user operation completed."));
