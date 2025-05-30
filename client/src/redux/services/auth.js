// redux/services/auth.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";

const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === "android") {
      return "http://192.168.225.147:8000/api/";
    }
    return "http://localhost:8000/api/";
  }
};

// const getBaseUrl = () => {
//   return "http://one-tab-m.onrender.com/";
// };

export const schoolApi = createApi({
  reducerPath: "schoolApi",
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers, { getState }) => {
      // Get the token from the auth state
      const token = getState().auth.token;
      const tenantId = getState().auth.tenantId;

      // If we have a token, add it to authorization header
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      // Add tenant ID to headers for all requests
      if (tenantId) {
        headers.set("X-Tenant-ID", tenantId);
      }

      return headers;
    },
  }),
  tagTypes: ['User', 'Student', 'Teacher', 'Class', 'Subject', 'Parent', 'Fee', 'Attendance', 'StaffAttendance'],
  endpoints: (builder) => ({
    // ================================
    // AUTH ENDPOINTS (User Routes)
    // ================================
    signupUser: builder.mutation({
      query: ({ tenantId, ...user }) => ({
        url: "signup",
        method: "POST",
        body: user,
        headers: tenantId ? { "X-Tenant-ID": tenantId } : {},
      }),
      invalidatesTags: ['User'],
    }),
    
    verifyEmail: builder.mutation({
      query: ({ tenantId, ...user }) => ({
        url: "verifyEmail",
        method: "POST",
        body: user,
        headers: tenantId ? { "X-Tenant-ID": tenantId } : {},
      }),
    }),
    
    loginUser: builder.mutation({
      query: ({ tenantId, ...user }) => ({
        url: "login",
        method: "POST",
        body: user,
        headers: tenantId ? { "X-Tenant-ID": tenantId } : {},
      }),
    }),
    
    changePassword: builder.mutation({
      query: (formdata) => ({
        url: "change-password",
        method: "POST",
        body: formdata,
      }),
    }),
    
    resetPassword: builder.mutation({
      query: ({ id, token, password, tenantId }) => ({
        url: `resetPassword/${id}/${token}`,
        method: "POST",
        body: { password },
        headers: tenantId ? { "X-Tenant-ID": tenantId } : {},
      }),
    }),

    requestOtp: builder.mutation({
      query: ({ tenantId, ...data }) => ({
        url: "request-otp",
        method: "POST",
        body: data,
        headers: tenantId ? { "X-Tenant-ID": tenantId } : {},
      }),
    }),

    resetPasswordWithOtp: builder.mutation({
      query: ({ tenantId, ...data }) => ({
        url: "reset-password-with-otp",
        method: "POST",
        body: data,
        headers: tenantId ? { "X-Tenant-ID": tenantId } : {},
      }),
    }),
    
    getUserProfile: builder.query({
      query: () => "profile",
      providesTags: ['User'],
    }),
    
    getAllUsers: builder.query({
      query: () => "user",
      providesTags: ['User'],
    }),
    
    updateProfileImage: builder.mutation({
      query: (formData) => ({
        url: "update-profile-image",
        method: "POST",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['User'],
    }),

    // ================================
    // CLASS ENDPOINTS
    // ================================
    createClass: builder.mutation({
      query: (data) => ({
        url: "class/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Class'],
    }),

    getClasses: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `class/all${searchParams ? `?${searchParams}` : ''}`;
      },
      providesTags: ['Class'],
    }),

    getClassById: builder.query({
      query: (id) => `class/${id}`,
      providesTags: (result, error, id) => [{ type: 'Class', id }],
    }),

    updateClass: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `class/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Class', id }],
    }),

    deleteClass: builder.mutation({
      query: (id) => ({
        url: `class/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Class'],
    }),

    addStudentToClass: builder.mutation({
      query: (data) => ({
        url: "class/add-student",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Class', 'Student'],
    }),

    removeStudentFromClass: builder.mutation({
      query: ({ classId, studentId }) => ({
        url: `class/${classId}/student/${studentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Class', 'Student'],
    }),

    updateClassSchedule: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `class/${id}/schedule`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Class', id }],
    }),

    updateSinglePeriod: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `class/${id}/period`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Class', id }],
    }),

    updateClassSubjects: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `class/${id}/subjects`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Class', id }],
    }),

    deleteClassSubjects: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `class/${id}/subjects`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Class', id }],
    }),

    // ================================
    // STUDENT ENDPOINTS
    // ================================
    getAllStudents: builder.query({
      query: () => "student/all",
      providesTags: ['Student'],
    }),

    getStudent: builder.query({
      query: (id) => `student/${id}`,
      providesTags: (result, error, id) => [{ type: 'Student', id }],
    }),

    getStudentsByClass: builder.query({
      query: (classId) => `student/class/${classId}`,
      providesTags: ['Student'],
    }),

    getStudentsByDemographics: builder.query({
      query: () => "student/demographics",
      providesTags: ['Student'],
    }),

    getStudentsByTransport: builder.query({
      query: (mode) => `student/transport/${mode}`,
      providesTags: ['Student'],
    }),

    getStudentsWithDisability: builder.query({
      query: () => "student/disability",
      providesTags: ['Student'],
    }),

    getStudentsByAdmission: builder.query({
      query: () => "student/admission",
      providesTags: ['Student'],
    }),

    createStudent: builder.mutation({
      query: (data) => ({
        url: "student/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Student'],
    }),

    updateStudent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `student/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Student', id }],
    }),

    deleteStudent: builder.mutation({
      query: (id) => ({
        url: `student/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Student'],
    }),

    getStudentAttendanceData: builder.query({
      query: (id) => `student/${id}/attendance`,
      providesTags: (result, error, id) => [{ type: 'Student', id }],
    }),

    getStudentResults: builder.query({
      query: (id) => `student/${id}/results`,
      providesTags: (result, error, id) => [{ type: 'Student', id }],
    }),

    getStudentFees: builder.query({
      query: (id) => `student/${id}/fees`,
      providesTags: (result, error, id) => [{ type: 'Student', id }],
    }),

    // ================================
    // TEACHER ENDPOINTS
    // ================================
    createTeacher: builder.mutation({
      query: (data) => ({
        url: "teacher/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Teacher'],
    }),

    getAllTeachers: builder.query({
      query: () => "teacher/all",
      providesTags: ['Teacher'],
    }),

    getTeacher: builder.query({
      query: (id) => `teacher/${id}`,
      providesTags: (result, error, id) => [{ type: 'Teacher', id }],
    }),

    updateTeacher: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `teacher/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Teacher', id }],
    }),

    deleteTeacher: builder.mutation({
      query: (id) => ({
        url: `teacher/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Teacher'],
    }),

    getTeacherClasses: builder.query({
      query: (id) => `teacher/${id}/classes`,
      providesTags: (result, error, id) => [{ type: 'Teacher', id }],
    }),

    getTeacherSubjects: builder.query({
      query: (id) => `teacher/${id}/subjects`,
      providesTags: (result, error, id) => [{ type: 'Teacher', id }],
    }),

    // ================================
    // SUBJECT ENDPOINTS
    // ================================
    createSubject: builder.mutation({
      query: (data) => ({
        url: "subject/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Subject'],
    }),

    getSubjects: builder.query({
      query: () => "subject/all",
      providesTags: ['Subject'],
    }),

    getSubjectById: builder.query({
      query: (id) => `subject/${id}`,
      providesTags: (result, error, id) => [{ type: 'Subject', id }],
    }),

    updateSubject: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `subject/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Subject', id }],
    }),

    deleteSubject: builder.mutation({
      query: (id) => ({
        url: `subject/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Subject'],
    }),

    // ================================
    // PARENT ENDPOINTS
    // ================================
    createParent: builder.mutation({
      query: (data) => ({
        url: "parent/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Parent'],
    }),

    getAllParents: builder.query({
      query: () => "parent/all",
      providesTags: ['Parent'],
    }),

    getParent: builder.query({
      query: (id) => `parent/${id}`,
      providesTags: (result, error, id) => [{ type: 'Parent', id }],
    }),

    updateParent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `parent/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Parent', id }],
    }),

    deleteParent: builder.mutation({
      query: (id) => ({
        url: `parent/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Parent'],
    }),

    getChildrenDetails: builder.query({
      query: (id) => `parent/${id}/children`,
      providesTags: (result, error, id) => [{ type: 'Parent', id }],
    }),

    // ================================
    // STUDENT ATTENDANCE ENDPOINTS
    // ================================
    markDailyAttendance: builder.mutation({
      query: (data) => ({
        url: "student-attendance/mark-daily",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),

    markPeriodAttendance: builder.mutation({
      query: (data) => ({
        url: "student-attendance/mark-period",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),

    bulkMarkDailyAttendance: builder.mutation({
      query: (data) => ({
        url: "student-attendance/bulk-mark-daily",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),

    bulkMarkPeriodAttendance: builder.mutation({
      query: (data) => ({
        url: "student-attendance/bulk-mark-period",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),

    getStudentAttendance: builder.query({
      query: ({ studentId, date }) => `student-attendance/student/${studentId}/${date}`,
      providesTags: ['Attendance'],
    }),

    getClassAttendance: builder.query({
      query: ({ classId, date }) => `student-attendance/class/${classId}/${date}`,
      providesTags: ['Attendance'],
    }),

    getStudentAttendanceReport: builder.query({
      query: ({ studentId, ...params }) => {
        const searchParams = new URLSearchParams(params).toString();
        return `student-attendance/report/student/${studentId}${searchParams ? `?${searchParams}` : ''}`;
      },
      providesTags: ['Attendance'],
    }),

    getClassAttendanceReport: builder.query({
      query: ({ classId, ...params }) => {
        const searchParams = new URLSearchParams(params).toString();
        return `student-attendance/report/class/${classId}${searchParams ? `?${searchParams}` : ''}`;
      },
      providesTags: ['Attendance'],
    }),

    deleteAttendance: builder.mutation({
      query: (attendanceId) => ({
        url: `student-attendance/${attendanceId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Attendance'],
    }),

    // ================================
    // STAFF ATTENDANCE ENDPOINTS
    // ================================
    markStaffDailyAttendance: builder.mutation({
      query: (data) => ({
        url: "staff-attendance/daily",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['StaffAttendance'],
    }),

    markStaffBulkAttendance: builder.mutation({
      query: (data) => ({
        url: "staff-attendance/bulk",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['StaffAttendance'],
    }),

    getStaffAttendanceById: builder.query({
      query: (id) => `staff-attendance/${id}`,
      providesTags: (result, error, id) => [{ type: 'StaffAttendance', id }],
    }),

    getStaffAttendance: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `staff-attendance/${searchParams ? `?${searchParams}` : ''}`;
      },
      providesTags: ['StaffAttendance'],
    }),

    updateStaffAttendance: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `staff-attendance/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'StaffAttendance', id }],
    }),

    deleteStaffAttendance: builder.mutation({
      query: (id) => ({
        url: `staff-attendance/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['StaffAttendance'],
    }),

    getStaffAttendanceStats: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams(params).toString();
        return `staff-attendance/stats${searchParams ? `?${searchParams}` : ''}`;
      },
      providesTags: ['StaffAttendance'],
    }),

    staffCheckIn: builder.mutation({
      query: (data) => ({
        url: "staff-attendance/check-in",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['StaffAttendance'],
    }),

    staffCheckOut: builder.mutation({
      query: (data) => ({
        url: "staff-attendance/check-out",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['StaffAttendance'],
    }),

    updateStaffSubstitution: builder.mutation({
      query: (data) => ({
        url: "staff-attendance/substitution",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['StaffAttendance'],
    }),

    // ================================
    // FEE ENDPOINTS
    // ================================
    getAllFees: builder.query({
      query: () => "fee/",
      providesTags: ['Fee'],
    }),

    createFee: builder.mutation({
      query: (data) => ({
        url: "fee/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ['Fee'],
    }),

    getFee: builder.query({
      query: (id) => `fee/${id}`,
      providesTags: (result, error, id) => [{ type: 'Fee', id }],
    }),

    updateFee: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `fee/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Fee', id }],
    }),

    deleteFee: builder.mutation({
      query: (id) => ({
        url: `fee/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Fee'],
    }),

    getStudentFeesData: builder.query({
      query: (studentId) => `fee/student/${studentId}`,
      providesTags: ['Fee'],
    }),

    getPendingFees: builder.query({
      query: () => "fee/status/pending",
      providesTags: ['Fee'],
    }),
  }),
});

// Export hooks for all endpoints
export const {
  // Auth hooks
  useSignupUserMutation,
  useVerifyEmailMutation,
  useLoginUserMutation,
  useChangePasswordMutation,
  useResetPasswordMutation,
  useRequestOtpMutation,
  useResetPasswordWithOtpMutation,
  useGetUserProfileQuery,
  useGetAllUsersQuery,
  useUpdateProfileImageMutation,

  // Class hooks
  useCreateClassMutation,
  useGetClassesQuery,
  useGetClassByIdQuery,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useAddStudentToClassMutation,
  useRemoveStudentFromClassMutation,
  useUpdateClassScheduleMutation,
  useUpdateSinglePeriodMutation,
  useUpdateClassSubjectsMutation,
  useDeleteClassSubjectsMutation,

  // Student hooks
  useGetAllStudentsQuery,
  useGetStudentQuery,
  useGetStudentsByClassQuery,
  useGetStudentsByDemographicsQuery,
  useGetStudentsByTransportQuery,
  useGetStudentsWithDisabilityQuery,
  useGetStudentsByAdmissionQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetStudentAttendanceDataQuery,
  useGetStudentResultsQuery,
  useGetStudentFeesQuery,

  // Teacher hooks
  useCreateTeacherMutation,
  useGetAllTeachersQuery,
  useGetTeacherQuery,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useGetTeacherClassesQuery,
  useGetTeacherSubjectsQuery,

  // Subject hooks
  useCreateSubjectMutation,
  useGetSubjectsQuery,
  useGetSubjectByIdQuery,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,

  // Parent hooks
  useCreateParentMutation,
  useGetAllParentsQuery,
  useGetParentQuery,
  useUpdateParentMutation,
  useDeleteParentMutation,
  useGetChildrenDetailsQuery,

  // Student Attendance hooks
  useMarkDailyAttendanceMutation,
  useMarkPeriodAttendanceMutation,
  useBulkMarkDailyAttendanceMutation,
  useBulkMarkPeriodAttendanceMutation,
  useGetStudentAttendanceQuery,
  useGetClassAttendanceQuery,
  useGetStudentAttendanceReportQuery,
  useGetClassAttendanceReportQuery,
  useDeleteAttendanceMutation,

  // Staff Attendance hooks
  useMarkStaffDailyAttendanceMutation,
  useMarkStaffBulkAttendanceMutation,
  useGetStaffAttendanceByIdQuery,
  useGetStaffAttendanceQuery,
  useUpdateStaffAttendanceMutation,
  useDeleteStaffAttendanceMutation,
  useGetStaffAttendanceStatsQuery,
  useStaffCheckInMutation,
  useStaffCheckOutMutation,
  useUpdateStaffSubstitutionMutation,

  // Fee hooks
  useGetAllFeesQuery,
  useCreateFeeMutation,
  useGetFeeQuery,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
  useGetStudentFeesDataQuery,
  useGetPendingFeesQuery,
} = schoolApi;