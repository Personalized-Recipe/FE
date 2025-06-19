import { createContext, useContext, useReducer } from 'react';

const UserContext = createContext({
     user: {
        age: '',
        gender: '',
        healthList: [],
        allergyList: [],
        preferList: [],
        dislikeList: []
    },
    dispatch: () => {}
});

const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, ...action.payload };
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'UPDATE_USER':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const UserProvider = ({ children }) => {
  const [user, dispatch] = useReducer(userReducer, {
    age: '',
    gender: '',
    healthList: [],
    allergyList: [],
    preferList: [],
    dislikeList: []
  });

  return (
    <UserContext.Provider value={{ user, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
