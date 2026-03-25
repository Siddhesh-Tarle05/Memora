import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, "email is required for creating account"],
        unique: [true, 'email already exits'],
        trim: true,
        lowercase: true,
        match: [/[a-z0-9_.+-]+@[a-z0-9_.+-]+\.[a-z0-9_.+-]+/i, "invalid email address"]
    },
    name:{
        type:String,
        required: [true, "name is required for creating account"],
    },
    password:{
        type:String,
        required: [true, "password is required for creating account"],
        minlength:[6,"password should contain more than 6 characters"],
        select:false
    }
},{
    timestamps:true
})


UserSchema.pre('save', async function () {

  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 10);

});

// Compare password method
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};
const UserModel=mongoose.model('users',UserSchema)
export default UserModel;