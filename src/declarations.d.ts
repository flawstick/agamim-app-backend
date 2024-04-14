declare global {
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
}
