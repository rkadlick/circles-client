import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../auth/supabaseClient';

interface AuthState {
  user: { id: string; email: string; username: string } | null;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
};

export const fetchUserDetails = createAsyncThunk(
  'auth/fetchUserDetails',
  async (userId: string) => {
    // Fetch user details from custom Users table
    const { data: userDetails, error } = await supabase
      .from('users')
      .select('username')
      .eq('user_id', userId)
      .single();

    if (error) throw new Error(error.message);

    // Return user details including username
    return { username: userDetails?.username || '' };
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async () => {
    const { data: sessionData, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);

    const session = sessionData?.session;
    if (session) {
      return { id: session.user.id, email: session.user.email, username: '' };
    }

    return null;
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const user = data.user;
    
    // Return user object with minimal data
    return user ? { id: user.id, email: user.email } : null;
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, username }: { email: string; password: string; username: string }) => {
    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);

    const user = data.user;

    if (user) {
      // Insert user details into the custom Users table
      const { error: dbError } = await supabase
        .from('users')
        .insert({ user_id: user.id, username });

      if (dbError) throw new Error(dbError.message);
    }

    // Return user object
    return { id: user?.id, email: user?.email };
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
});

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
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        if (state.user) {
          state.user.username = action.payload.username;
        }
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'idle';
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = 'failed';
        state.user = null;
      })
      .addCase(logout.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = 'idle';
        state.user = null; // Clear user info on logout
      })
      .addCase(logout.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default authSlice.reducer;
