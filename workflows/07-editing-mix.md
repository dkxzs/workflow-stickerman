# Workflow 07: Video Editing & Audio Mix

## Mục Tiêu
Ghép nối toàn bộ video phân cảnh, hòa âm đa lớp (Voice + SFX + BGM) và tạo phụ đề tự động thành một video hoàn chỉnh.

## Vai Trò Phụ Trách
- **Agent**: `AGENT-07-EDITOR`
- **Input**: `audio_scenes/`, `video_scenes/`, `base_assets/sfx/`, `base_assets/bgm/`
- **Output**: Video hoàn chỉnh tại `projects/{project_id}/output/{project_id}_final_master.mp4`

## Các Bước Thực Hiện
1. **Nối dải hình ảnh (Visual Timeline Stitching)**:
   - Ghép nối tuần tự các clip từ `video_scenes/`.
2. **Hòa âm đa lớp (Audio Layering & Ducking)**:
   - Kênh 1: Giọng đọc (Voiceover) - chuẩn hóa `-14 LUFS`.
   - Kênh 2: Hiệu ứng âm thanh (SFX) đặt chính xác tại các mốc kích hoạt.
   - Kênh 3: Nhạc nền (BGM) - chuẩn hóa `-26 LUFS`, tự động ducking giảm 6dB khi có giọng nói.
3. **Tạo phụ đề động (Dynamic Captions)**:
   - Chèn phụ đề nổi bật cho các từ khóa quan trọng để tăng tỷ lệ chú ý của người xem.
4. **Xuất bản nháp (Master Render)**:
   - Render video 1080p/4K với codec H.264/AAC chất lượng cao.
