const fs = require('fs');
let fileContent = fs.readFileSync('d:/FPT/og/VisualizationDSA/frontend/src/views/ProfileView.vue', 'utf8');

// Update accept attribute
fileContent = fileContent.replace('accept=".pdf,image/*"', 'accept=".pdf"');
fileContent = fileContent.replace('Hỗ trợ PDF, JPG, PNG', 'Chỉ hỗ trợ PDF');

// Update the submit logic
const submitLogic = `const submitApplication = async () => {
  if (!appForm.cvFile) {
    return toastStore.error("Vui lòng tải lên CV của bạn");
  }
  
  isSubmittingApp.value = true;
  try {
    // 1. Upload CV PDF first
    const fileData = new FormData();
    fileData.append('file', appForm.cvFile);
    
    // api.post returns response.data already in this boilerplate?
    // Looking at apiClient.ts, it returns response.data
    const uploadRes = await api.post<any>('/upload/cv-document', fileData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    if (!uploadRes.url) throw new Error("Không lấy được link CV");

    // 2. Submit application
    const payload = {
      SchoolName: appForm.experience, // using experience as SchoolName since DB schema requires it
      CvUrl: uploadRes.url,
      Reason: appForm.reason
    };

    await api.post('/teacher-applications', payload);
    toastStore.success('Đã gửi yêu cầu thành công! Chúng tôi sẽ xem xét sớm nhất.');
    
    // Clear form
    appForm.experience = '';
    appForm.reason = '';
    appForm.cvFile = null;
  } catch (err: any) {
    toastStore.error(err.response?.data?.message || err.message || 'Lỗi khi gửi yêu cầu');
  } finally {
    isSubmittingApp.value = false;
  }
};`;

fileContent = fileContent.replace(/const submitApplication = async \(\) => {[\s\S]*?};\n/, submitLogic + '\n');
fs.writeFileSync('d:/FPT/og/VisualizationDSA/frontend/src/views/ProfileView.vue', fileContent);
console.log('Fixed submit logic in ProfileView.vue');
