import cv2
import os

def generate_video(video_script, images, output_path='videos/output_video.mp4'):
    # Ensure the output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Set video parameters
    frame_width = 640
    frame_height = 480
    fps = 24

    # Create a VideoWriter object
    out = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*'mp4v'), fps, (frame_width, frame_height))

    for scene in video_script.get('scenes', []):
        img_path = scene.get('image')
        text = scene.get('text')
        duration = scene.get('duration', 3)  # duration in seconds

        # Read the image
        img = cv2.imread(img_path)
        if img is None:
            print(f"Warning: Image {img_path} not found, skipping this scene.")
            continue

        # Resize the image to fit the video frame
        img = cv2.resize(img, (frame_width, frame_height))

        # Add text overlay (caption) to the image
        font = cv2.FONT_HERSHEY_SIMPLEX
        text_position = (10, frame_height - 20)  # Position the text at the bottom
        cv2.putText(img, text, text_position, font, 1, (255, 255, 255), 2, cv2.LINE_AA)

        # Write the image to the video multiple times to maintain the specified duration
        for _ in range(int(fps * duration)):
            out.write(img)

    # Release the VideoWriter
    out.release()
    return output_path
