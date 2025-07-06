const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        user: null,
        isFetching: true,
        error: false,
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload,
        isFetching: false,
        error: false,
      };
    case "LOGIN_FAILURE":
      return {
        user: null,
        isFetching: false,
        error: true,
      };
    case "FAVORIS":
      return {
        ...state,
        user: {
          ...state.user,
          favoris: [...state.user?.user.favoris, action.payload],
        },
      };
    case "UNFAVORIS":
      return {
        ...state,
        user: {
          ...state.user,
          favoris: state.user?.user.favoris.filter(
            (following) => following !== action.payload
          ),
        },
      };
    default:
      return state;
  }
};

export default AuthReducer;
