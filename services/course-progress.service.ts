import axiosInstance from "@/lib/axios";

export interface CourseProgressDto {
  id: number;
  courseId: number;
  lessonId: number;
  isCompleted: boolean;
  personalNotes: string;
}

export const CourseProgressService = {
  getCourseProgress: async (courseId: number): Promise<CourseProgressDto[]> => {
    try {
      const response = await axiosInstance.get(`/api/catalog/lms/progress/${courseId}`);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching course progress:", error);
      return [];
    }
  },

  toggleCompletion: async (courseId: number, lessonId: number): Promise<CourseProgressDto | null> => {
    try {
      const response = await axiosInstance.post(`/api/catalog/lms/progress/${lessonId}/complete?courseId=${courseId}`);
      return response.data;
    } catch (error) {
      console.error("Error toggling completion:", error);
      return null;
    }
  },

  saveNotes: async (courseId: number, lessonId: number, notes: string): Promise<CourseProgressDto | null> => {
    try {
      const response = await axiosInstance.put(`/api/catalog/lms/progress/${lessonId}/notes?courseId=${courseId}`, {
        notes
      });
      return response.data;
    } catch (error) {
      console.error("Error saving notes:", error);
      return null;
    }
  }
};
