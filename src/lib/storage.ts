const STUDENT_KEY = 'quizStudent';
const RESULT_KEY = 'quizResult';

export const storage = {
  getStudent: () => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STUDENT_KEY);
      return data ? JSON.parse(data) : null;
    }
    return null;
  },
  
  setStudent: (student: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STUDENT_KEY, JSON.stringify(student));
    }
  },
  
  getResult: () => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(RESULT_KEY);
      return data ? JSON.parse(data) : null;
    }
    return null;
  },
  
  setResult: (result: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(RESULT_KEY, JSON.stringify(result));
    }
  },
  
  clearResult: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(RESULT_KEY);
    }
  },
  
  clearAll: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STUDENT_KEY);
      localStorage.removeItem(RESULT_KEY);
    }
  }
};