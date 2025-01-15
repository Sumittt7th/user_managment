
import { Router } from "express";
import { catchError } from "../common/middleware/cath-error.middleware";
import * as userController from "./user.controller";
import * as userValidator from "./user.validation";
import { roleAuth } from "../common/middleware/role-auth.middleware";
import { upload } from "../common/middleware/multer-upload.middleware";

const router = Router();

router
  .get("/", userController.getAllUser)
  .get("/:id", userController.getUserById)
  .delete("/:id", userController.deleteUser)
  .put("/:id", userValidator.updateUser, catchError, userController.updateUser)
  .patch("/:id", userValidator.editUser, catchError, userController.editUser)
  .post("/login", userValidator.loginUser, catchError, userController.loginUser)
  .post(
    "/create-user",
    userValidator.createUser,
    roleAuth("ADMIN"),
    catchError,
    userController.createUserByAdmin
  )
  .post(
    "/set-password",
    userValidator.setPassword,
    catchError,
    userController.setPassword
  )
  .post(
    "/set-profile",
    roleAuth("USER"),
    catchError,
    userController.setProfile
  )
  .post(
    "/set-kyc",
    roleAuth("USER"),
    upload.single("image"),
    userController.setKyc
  )
  .patch(
    "/:id/active",
    roleAuth("ADMIN"),
    catchError,
    userController.activeUser
  )
  .patch("/2FA",
    roleAuth("USER"),
    catchError,
    userController.enableTwoFactorAuth
  );
  

export default router;

