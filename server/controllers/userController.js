import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js";


//Signup a new user
export const signup = async ()=>{
    const { fullName, email, password, bio } = req.body;

    try{
        if (!fullName || !email || !password || !bio) {
            return re.json({sucess: false, message: "Missing Details"})
        }
        const user = await User.findOne({email});

        if(user){
            return res.json({sucess: false, message: "Account already exits"})
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        });

        const token = generateToken(newUser._id)

        res.json({sucess: true, userData: newUser, token, message: "Account created sucessfully "})

    }catch(error) {
        console.log(error.message);

        res.json({sucess: false, message: error.message})
    }
}

//controller to login a user
export const login = async (req, res) => {
    try {
        const {email, password } = req.body;
        const userData = await User.findOne({email})

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if(!isPasswordCorrect){
            return rejson({ sucess: false, message: "Invalid credentials "});
        }

        const token = generateToken(newUser._id)

        res.json({sucess : true, userData, token, message : "account created sucessfully"})
    } catch (error) {
        console.log(error.message);

        res.json({sucess: false, message: error.message})
    }
}


// Controller to check if user is authenticated
export const checkAuth = (req, res)=>{
    res.json({sucess: true, user: req.user});
}

// Controller to update user profile details...
export const updateProfile = async (req, res) => {
    try{
        const { profilePic, bio, fullName } = req.body;

        const userId = req.user._id;
        let updateUser;

        if(profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName},{new: true});
        } else{
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true});
        }
        res.json({sucess: true, user: updatedUser})
    } catch (error) {
        res.json({sucess: false, message: error.message})
    }
}








