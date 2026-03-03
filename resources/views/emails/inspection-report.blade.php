<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inspection Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px;
        }
        
        .email-container {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        
        .header-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            z-index: 1;
        }
        
        .logo-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 30px;
            margin-bottom: 25px;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            object-fit: contain;
            border-radius: 8px;
            background: white;
            padding: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="80" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="50" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="30" r="1" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
            opacity: 0.3;
        }
        
        .header h1 {
            color: white;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .header .subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            font-weight: 400;
            margin-bottom: 4px;
        }
        
        .header .location {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .message-box {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
            position: relative;
            overflow: hidden;
        }
        
        .message-box::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .message-content {
            position: relative;
            z-index: 1;
            color: white;
            font-size: 16px;
            font-weight: 500;
            text-align: center;
        }
        
        .details-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            border-left: 4px solid #667eea;
        }
        
        .details-card h3 {
            color: #667eea;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
        }
        
        .details-card h3::before {
            content: '📋';
            margin-right: 10px;
            font-size: 24px;
        }
        
        .details-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        
        .detail-item {
            display: flex;
            align-items: flex-start;
        }
        
        .detail-label {
            font-weight: 600;
            color: #6c757d;
            min-width: 120px;
            font-size: 14px;
        }
        
        .detail-value {
            color: #2c3e50;
            font-weight: 500;
            font-size: 14px;
        }
        
        .features-section {
            background: white;
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            border: 1px solid #e9ecef;
        }
        
        .features-section h3 {
            color: #2c3e50;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .features-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        
        .feature-item {
            display: flex;
            align-items: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            transition: transform 0.2s ease;
        }
        
        .feature-item:hover {
            transform: translateY(-2px);
            background: #e9ecef;
        }
        
        .feature-icon {
            font-size: 20px;
            margin-right: 12px;
        }
        
        .feature-text {
            color: #495057;
            font-size: 14px;
            font-weight: 500;
        }
        
        .important-notice {
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .important-notice p {
            color: white;
            font-weight: 600;
            font-size: 15px;
        }
        
        .footer {
            background: #2c3e50;
            padding: 30px;
            text-align: center;
        }
        
        .footer-content {
            color: #ecf0f1;
        }
        
        .footer-title {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 10px;
        }
        
        .footer-subtitle {
            font-size: 14px;
            opacity: 0.8;
            margin-bottom: 15px;
        }
        
        .footer-divider {
            width: 60px;
            height: 2px;
            background: #667eea;
            margin: 15px auto;
        }
        
        .footer-note {
            font-size: 12px;
            opacity: 0.6;
            margin-top: 15px;
        }
        
        @media (max-width: 600px) {
            .details-grid,
            .features-list {
                grid-template-columns: 1fr;
            }
            
            .detail-item {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .detail-label {
                margin-bottom: 5px;
                min-width: auto;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="header-content">
                <h1>Inspection Report</h1>
                <div class="subtitle">Municipal Environmental and Natural Resources Office</div>
                <div class="location">Municipality of Opol, Misamis Oriental</div>
            </div>
        </div>
        
        <div class="content">
            <div class="message-box">
                <div class="message-content">
                    {{ $customMessage }}
                </div>
            </div>
            
            <div class="details-card">
                <h3>Inspection Details</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">🏢 Establishment:</span>
                        <span class="detail-value">{{ $inspectionResult->establishment->name ?? 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">🏭 Business Type:</span>
                        <span class="detail-value">{{ $inspectionResult->establishment->type_of_business ?? 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">📍 Address:</span>
                        <span class="detail-value">{{ $inspectionResult->establishment->address ?? 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">📅 Inspection Date:</span>
                        <span class="detail-value">{{ $inspectionResult->inspection->inspection_timestamp->format('F j, Y') ?? 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">📊 Quarter:</span>
                        <span class="detail-value">{{ $inspectionResult->inspection->quarter ?? 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">👤 Inspector:</span>
                        <span class="detail-value">{{ $inspectionResult->staff ? ($inspectionResult->staff->first_name . ' ' . $inspectionResult->staff->last_name) : 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">🔖 Report ID:</span>
                        <span class="detail-value">#{{ $inspectionResult->id }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">📆 Report Date:</span>
                        <span class="detail-value">{{ $inspectionResult->created_at->format('F j, Y') }}</span>
                    </div>
                </div>
            </div>
            
            <div class="features-section">
                <h3>📋 What's Included in This Report</h3>
                <div class="features-list">
                    <div class="feature-item">
                        <span class="feature-icon">🏢</span>
                        <span class="feature-text">Complete establishment information</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✅</span>
                        <span class="feature-text">Detailed checklist responses</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">📊</span>
                        <span class="feature-text">Compliance status analysis</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">💡</span>
                        <span class="feature-text">Actionable recommendations</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">📈</span>
                        <span class="feature-text">Utility data (if applicable)</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✍️</span>
                        <span class="feature-text">Official signatures</span>
                    </div>
                </div>
            </div>
            
            <div class="important-notice">
                <p>⚠️ <strong>Important:</strong> This is an official inspection report. Please keep it for your records.</p>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-content">
                <div class="footer-title">Republic of the Philippines</div>
                <div class="footer-subtitle">Province of Misamis Oriental • Municipality of Opol</div>
                <div class="footer-divider"></div>
                <div class="footer-subtitle">Municipal Environmental and Natural Resources Office</div>
                <div class="footer-note">Report ID: #{{ $inspectionResult->id }} | Generated: {{ date('F j, Y') }}</div>
                <div class="footer-note">This is an automated message. For inquiries, please contact our office during business hours.</div>
            </div>
        </div>
    </div>
</body>
</html>
