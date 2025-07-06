export const LoginStart = (userCredentials) => ({
  type: "LOGIN_START",
});

export const LoginSuccess = (user) => ({
  type: "LOGIN_SUCCESS",
  payload: user,
});

export const LoginFailure = () => ({
  type: "LOGIN_FAILURE",
});

export const Favoris = (userId) => ({
  type: "FAVORIS",
  payload: userId,
});

export const UnFavoris = (userId) => ({
  type: "UNFAVORIS",
  payload: userId,
});
