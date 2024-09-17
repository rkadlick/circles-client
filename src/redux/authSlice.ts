import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../auth/supabaseClient';

interface AuthState {
  user: unknown | null;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
};

export const signIn = createAsyncThunk(
	'auth/signIn',
	async ({ email, password }: { email: string; password: string }) => {
	  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
	  if (error) throw new Error(error.message);
	  return data.user;
	}
  );

  export const signUp = createAsyncThunk(
	'auth/signUp',
	async ({ email, password, username }: { email: string; password: string; username: string }) => {
	  const { data, error } = await supabase.auth.signUp({ email, password });
	  if (error) throw new Error(error.message);
  
	  // Assuming user object is returned and you need to insert into custom table
	  const user = data.user;
  
	  // Optionally insert into custom table if needed
	  if (user) {
		const { error: dbError } = await supabase
		  .from('users')
		  .insert({ user_id: user.id, username });
  
		if (dbError) throw new Error(dbError.message);
	  }
  
	  return user;
	}
  );

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload;
      })
      .addCase(signIn.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(signUp.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload;
      })
      .addCase(signUp.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default authSlice.reducer;
