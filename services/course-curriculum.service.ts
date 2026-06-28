import axiosInstance from "@/lib/axios";
import { CourseModule, CourseLesson } from "@/types/catalog";

export const CourseCurriculumService = {
  getCurriculum: async (catalogItemId: number) => {
    const response = await axiosInstance.get(`/api/catalog/courses/${catalogItemId}/curriculum`);
    return response.data;
  },

  createModule: async (catalogItemId: number, module: Partial<CourseModule>) => {
    const response = await axiosInstance.post(`/api/catalog/courses/${catalogItemId}/modules`, module);
    return response.data;
  },

  updateModule: async (catalogItemId: number, moduleId: number, module: Partial<CourseModule>) => {
    const response = await axiosInstance.put(`/api/catalog/courses/${catalogItemId}/modules/${moduleId}`, module);
    return response.data;
  },

  deleteModule: async (catalogItemId: number, moduleId: number) => {
    await axiosInstance.delete(`/api/catalog/courses/${catalogItemId}/modules/${moduleId}`);
  },

  createLesson: async (catalogItemId: number, moduleId: number, lesson: Partial<CourseLesson>) => {
    const response = await axiosInstance.post(`/api/catalog/courses/${catalogItemId}/modules/${moduleId}/lessons`, lesson);
    return response.data;
  },

  updateLesson: async (catalogItemId: number, moduleId: number, lessonId: number, lesson: Partial<CourseLesson>) => {
    const response = await axiosInstance.put(`/api/catalog/courses/${catalogItemId}/modules/${moduleId}/lessons/${lessonId}`, lesson);
    return response.data;
  },

  deleteLesson: async (catalogItemId: number, moduleId: number, lessonId: number) => {
    await axiosInstance.delete(`/api/catalog/courses/${catalogItemId}/modules/${moduleId}/lessons/${lessonId}`);
  },

  generateVideoUploadUrl: async (catalogItemId: number, file: File) => {
    const response = await axiosInstance.post(`/api/catalog/courses/${catalogItemId}/videos/upload-url`, {
      fileName: file.name,
      contentType: file.type,
      sizeInBytes: file.size,
      mediaType: "COURSE_LESSON_VIDEO"
    });
    return response.data;
  }
};
