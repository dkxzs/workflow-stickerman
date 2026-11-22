# 🚀 BẢN BÀN GIAO TOÀN DIỆN DỰ ÁN (PROJECT HANDOFF BRIEF)
> **Dành cho Model Gemini mới (Gemini 4 Hydrogen / Argon)**  
> **Dự án:** `youtube-content-engine` (Hệ thống tạo video hoạt hình Người Que 2D tự động chuẩn YouTube)  
> **Mục tiêu:** Sản xuất video hoạt hình người que giải thích kiến thức (Stickman Explainer), chuẩn 1080p @ 30fps, tự động hóa từ kịch bản đến video thành phẩm với chi phí 0 VNĐ.

---

## 1. TÍNH CÁCH & TIÊU CHUẨN CỦA USER (ĐẶC BIỆT LƯU Ý)
- **User là người cực kỳ kỹ tính và có tư duy sản phẩm chuyên nghiệp để kiếm tiền thật trên YouTube.**
- **Tuyệt đối cấm làm ẩu, làm qua loa hoặc vẽ chắp vá méo mó**: Mọi chi tiết (máy tính, bàn làm việc, ghế xoay, cốc nước, icon) đều phải chuẩn tỉ lệ, căn chính xác từng pixel và hợp lý về mặt vật lý.
- **Tính liên tục của đạo cụ (Physical Continuity)**: Đồ vật trên tay thì không được nhân đôi dưới đất hay trên bàn. Khi đặt xuống bàn thì trên tay không còn. Cấm để đạo cụ tự bốc hơi giữa các giây.
- **Diễn xuất có hồn (Micro-acting Beats)**: Người que phải có chuỗi biến đổi tâm lý tự nhiên (ví dụ: nhìn điện thoại háo hức $\to$ thấy trống không $\to$ thở dài đặt xuống bàn $\to$ chống cằm nheo mắt suy tư $\to$ vài giây sau bồn chồn lại với tay lấy máy tiếp).

---

## 2. KIẾN TRÚC KỸ THUẬT CỐT LÕI (CORE ARCHITECTURE)
Hệ thống đã trải qua quá trình tối ưu và chốt hạ kiến trúc vượt trội hoàn toàn so với các phương pháp cũ:

1. **Lõi Đồ Họa (Rendering Engine - Node.js + Vector SVG)**:
   - **KHÔNG dùng Python Pillow**: Đã bỏ cách vẽ pixel thủ công cũ kỹ vì chậm và răng cưa.
   - **DÙNG**: Node.js + Sharp (C++ libvips) + Vector SVG + `@napi-rs/canvas`.
   - File kết xuất chính: `engine/vector_scene_renderer.mjs`.
   - Tốc độ: Render 1080p cực nhanh (~4s đến 5s cho một phân cảnh 60–70 frames).

2. **Thư Viện Bối Cảnh Linh Hoạt (LOD Background Library)**:
   - File: `engine/backgrounds.mjs`.
   - Hỗ trợ 7 môi trường: Văn phòng (`office`), Đường phố (`street`), Bệnh viện (`hospital`), Biển/Hồ (`water`), Lớp học (`classroom`), Công viên (`nature`), Không gian trừu tượng (`void`).
   - Hỗ trợ 2 cấp độ theo đúng chỉ đạo của user:
     - `detail: 'high'`: Dành cho cảnh đinh (hero scenes) như phòng làm việc có bàn ghế, máy tính chuẩn vector, cửa sổ ánh sáng mặt trời, cốc cà phê bốc khói.
     - `detail: 'low'`: Dành cho cảnh lướt, ẩn dụ, so sánh nhanh để tập trung vào nhân vật và biểu đồ.

3. **Cái Tai Nghe: Whisper AI (Tự động bóc tách thời gian từng từ - 0 Đồng)**:
   - File: `engine/voice_aligner.py`.
   - Chạy mô hình `faster-whisper` offline 100% trên CPU (int8) của máy tính, không tốn 1 xu API.
   - Nhận diện giọng nói và xuất file JSON chứa mốc thời gian chính xác (start, end) của từng từ và từng câu.

4. **Giọng Đọc Tự Nhiên (Voiceover)**:
   - Hai chất giọng chuẩn nhất đã được test kỹ: `en-US-BrianNeural` (trầm ấm, tâm sự) và `en-GB-RyanNeural` (hóm hỉnh, thông minh kiểu CGP Grey).
   - Đã áp dụng kỹ thuật ngắt nghỉ tự nhiên (Humanized Pacing) để đảm bảo video đạt chuẩn Bật Kiếm Tiền YouTube 100%, không bị dính cờ bot rác.

5. **Bộ Điều Phối 1 Lệnh (Auto Director)**:
   - File: `engine/auto_director.mjs`.
   - Lệnh chạy thử 6 cảnh: `node engine/auto_director.mjs --preview=6`
   - Lệnh chạy full toàn bộ video: `node engine/auto_director.mjs`

---

## 3. CẤU TRÚC THƯ MỤC DỰ ÁN
```
d:/video/youtube-content-engine/
├── instructions/               # BỘ QUY TẮC BẮT BUỘC (Đã commit Git)
│   ├── GLOBAL_RULES.md         # Quy chuẩn chung & cam kết chất lượng
│   ├── STORYBOARD_RULES.md     # Quy tắc phân cảnh, pacing 3.5s & micro-acting
│   ├── SCRIPT_GUIDELINES.md    # Hướng dẫn viết kịch bản lôi cuốn
│   └── VISUAL_STICKMAN.md      # Quy chuẩn tư thế người que & props
├── engine/                     # MÃ NGUỒN CỐT LÕI
│   ├── auto_director.mjs       # Pipeline 1 lệnh điều phối toàn bộ
│   ├── vector_scene_renderer.mjs # Trình vẽ vector SVG 1080p
│   ├── backgrounds.mjs         # Thư viện 7 bối cảnh linh hoạt (High/Low LOD)
│   ├── voice_aligner.py        # Module Whisper bóc tách thời gian offline
│   ├── icons.py & vocab.py     # Thư viện icon & từ vựng storyboard
│   └── tts_engine.py           # Module tạo giọng đọc Edge-TTS
├── projects/video-001/         # DỰ ÁN HIỆN TẠI
│   ├── 01_research.md          # Nghiên cứu chủ đề
│   ├── 02_script.md            # Kịch bản lời dẫn
│   ├── 03_storyboard.json      # Bảng phân cảnh 42 scenes
│   ├── audio_scenes/           # 42 file audio MP3 cho từng cảnh
│   └── output/                 # Thư mục xuất video thành phẩm
└── package.json                # Dependencies: sharp, @napi-rs/canvas
```

---

## 4. LỆNH DÀNH CHO USER ĐỂ KÍCH HOẠT CON GEMINI MỚI
Khi mở chat mới với Gemini 4 Hydrogen / Argon, chỉ cần copy & paste câu sau:

```text
Hãy đọc kỹ file HANDOFF_FOR_GEMINI.md tại thư mục gốc của dự án. 
Đây là toàn bộ kiến trúc kỹ thuật, quy tắc sản xuất và tiến độ của hệ thống YouTube Content Engine.
Sau khi đọc xong, hãy xác nhận bạn đã nắm được tiêu chuẩn kỹ tính của tôi, kiến trúc Node.js/SVG hiện tại, và báo cáo việc sẵn sàng nhận lệnh tiếp theo để hoàn thiện video.
```
