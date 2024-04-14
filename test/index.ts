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

const weaviateEndpoint = "http://51.17.228.147/v1/objects";
async function addUser(user: User): Promise<void> {
  try {
    const response = await axios.post(weaviateEndpoint, {
      class: "User",
      properties: {
        uuid: user.uuid,
        username: user.username,
        hashedPassword: user.hashedPassword,
        FirstName: user.firstName,
        LastName: user.lastName,
        profilePicture: user.profilePicture,
        lastLogin: user.lastLogin,
        clockId: user.clockId,
        hoursWorked: user.hoursWorked,
        shifts: user.shifts,
        settings: user.settings,
      },
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
