import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import config from '../config-auth';

const poolData = {
  UserPoolId: config.cognito.userPoolId,
  ClientId: config.cognito.clientId
};

const userPool = new CognitoUserPool(poolData);

export const AuthService = {
  signUp: (email, password, name) => {
    return new Promise((resolve, reject) => {
      const attributeList = [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name }
      ];

      userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  },

  signIn: (email, password) => {
    return new Promise((resolve, reject) => {
      const authenticationData = {
        Username: email,
        Password: password
      };

      const authenticationDetails = new AuthenticationDetails(authenticationData);
      const userData = {
        Username: email,
        Pool: userPool
      };

      const cognitoUser = new CognitoUser(userData);

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          const token = result.getIdToken().getJwtToken();
          const payload = result.getIdToken().payload;
          resolve({
            email: payload.email,
            name: payload.name,
            token: token
          });
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  },

  getCurrentUser: () => {
    return new Promise((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser();

      if (!cognitoUser) {
        resolve(null);
        return;
      }

      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err);
          return;
        }

        if (!session.isValid()) {
          resolve(null);
          return;
        }

        const token = session.getIdToken().getJwtToken();
        const payload = session.getIdToken().payload;

        resolve({
          email: payload.email,
          name: payload.name,
          token: token
        });
      });
    });
  },

  signOut: () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
  },

  getToken: async () => {
    const user = await AuthService.getCurrentUser();
    return user ? user.token : null;
  }
};
