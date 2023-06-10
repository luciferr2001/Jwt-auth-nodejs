
import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
  
    if (!token) {
      return res.status(403).send({ message: "No token provided!" });
    }
  
    jwt.verify(token,process.env.ACCESS_TOKEN_PRIVATE_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).send({ message: err });
      }
      next();
    });
  };

  export default verifyToken;