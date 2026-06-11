import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: {
            type:String,
            unique:true,
            required:true
        },
        email: {
            type:String,
            unique:true,
            required:true
        },
        password: {
            type:String,
            required:true
        },
        profilePicture: {
            type: String,
            default: "https://cdn.pixabay.com/photo/2017/06/13/12/53/profile-2398782_1280.png",
        },
    },
    {timestamps:true}
)


const User = mongoose.model('user', userSchema);
export default User;