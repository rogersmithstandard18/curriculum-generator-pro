// Enhanced error display
function showError(message) {
    // Remove any existing error alerts
    const existingError = document.querySelector('.error-alert');
    if (existingError) {
        existingError.remove();
    }

    // Create and show error alert
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-alert';
    errorDiv.style.cssText = `
        background: #fee2e2;
        border: 1px solid #fecaca;
        color: #dc2626;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        font-weight: 500;
    `;
    errorDiv.innerHTML = `⚠️ ${message}`;
    
    const form = document.getElementById('curriculumForm');
    form.parentNode.insertBefore(errorDiv, form.nextSibling);

    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 10000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-alert';
    successDiv.style.cssText = `
        background: #d1fae5;
        border: 1px solid #a7f3d0;
        color: #065f46;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        font-weight: 500;
    `;
    successDiv.innerHTML = `✅ ${message}`;
    
    const outputSection = document.getElementById('outputSection');
    outputSection.insertBefore(successDiv, outputSection.firstChild);

    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 5000);
}

// Quick select functionality
document.querySelectorAll('.quick-select').forEach(container => {
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('quick-btn')) {
            // Clear other selections in this group
            container.querySelectorAll('.quick-btn').forEach(btn => btn.classList.remove('selected'));
            // Select clicked button
            e.target.classList.add('selected');
            
            // Update corresponding input field
            const value = e.target.getAttribute('data-value');
            const containerId = container.id;
            
            if (containerId === 'roleSelect') {
                document.getElementById('customRole').value = value;
            } else if (containerId === 'domainSelect') {
                document.getElementById('customDomain').value = value;
            } else if (containerId === 'audienceSelect') {
                document.getElementById('customAudience').value = value;
            }
        }
    });
});

// Enhanced form submission with security
document.getElementById('curriculumForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        // Rate limiting check
        SecurityManager.checkRateLimit();

        // Get and validate form data
        const rawData = {
            role: document.getElementById('customRole').value || 'educator',
            domain: document.getElementById('customDomain').value || 'general education',
            subject: document.getElementById('subjectName').value,
            audience: document.getElementById('customAudience').value || 'students',
            duration: document.getElementById('duration').value,
            sessionLength: document.getElementById('sessionLength').value
        };

        // Validate and sanitize all inputs
        const formData = {
            role: SecurityManager.validateInput(rawData.role, 'Role'),
            domain: SecurityManager.validateInput(rawData.domain, 'Domain'),
            subject: SecurityManager.validateInput(rawData.subject, 'Subject Name'),
            audience: SecurityManager.validateInput(rawData.audience, 'Target Audience'),
            duration: rawData.duration,
            sessionLength: rawData.sessionLength
        };

        // Required field validation
        if (!formData.subject.trim()) {
            throw new Error('Subject Name is required');
        }

        // Content moderation check
        const fullPrompt = `${formData.role} ${formData.domain} ${formData.subject} ${formData.audience}`;
        const moderationResult = await SecurityManager.moderateContent(fullPrompt);
        
        if (!moderationResult.safe) {
            throw new Error('Content flagged by our moderation system. Please ensure your curriculum topic is appropriate for educational use.');
        }

        // Show output section and loading
        document.getElementById('outputSection').classList.add('show');
        document.getElementById('loadingDiv').style.display = 'block';
        document.getElementById('curriculumOutput').style.display = 'none';

        // Update step indicator
        document.querySelectorAll('.step')[1].classList.add('active');

        // Log successful validation (in production, send to analytics)
        console.log('Security validation passed:', {
            timestamp: new Date().toISOString(),
            moderationScore: moderationResult.confidence
        });

        // Generate curriculum with validated data
        setTimeout(() => {
            generateCurriculum(formData);
        }, 2000);

    } catch (error) {
        console.error('Security validation failed:', error);
        showError(error.message);
    }
});

async function generateCurriculum(data) {
    try {
        // Additional output moderation before display
        const curriculumText = `${data.subject} curriculum for ${data.audience} by ${data.role}`;
        const outputModeration = await SecurityManager.moderateContent(curriculumText);
        
        if (!outputModeration.safe) {
            throw new Error('Generated content was flagged by our safety systems. Please try different parameters.');
        }

        const curriculum = `
        <h4>${data.duration}-Week ${SecurityManager.sanitizeInput(data.subject)} Curriculum</h4>
        <p><strong>Role:</strong> ${SecurityManager.sanitizeInput(data.role)} | <strong>Domain:</strong> ${SecurityManager.sanitizeInput(data.domain)} | <strong>Audience:</strong> ${SecurityManager.sanitizeInput(data.audience)}</p>
        
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
            <strong>🛡️ Content Verified:</strong> This curriculum has passed our safety and appropriateness checks for educational use.
        </div>
        
        <h5>📅 Weekly Breakdown:</h5>
        <ul>
            <li><strong>Week 1-2:</strong> Foundation & Core Concepts</li>
            <li><strong>Week 3-4:</strong> Fundamental Skills Development</li>
            <li><strong>Week 5-6:</strong> Practical Applications</li>
            <li><strong>Week 7-8:</strong> Advanced Techniques</li>
            <li><strong>Week 9-10:</strong> Real-world Projects</li>
            <li><strong>Week 11-12:</strong> Mastery & Assessment</li>
        </ul>

        <h5>🎯 Key Learning Outcomes:</h5>
        <ul>
            <li>Master fundamental ${SecurityManager.sanitizeInput(data.subject)} principles</li>
            <li>Apply knowledge through hands-on projects</li>
            <li>Develop critical thinking and problem-solving skills</li>
            <li>Build portfolio-ready work samples</li>
        </ul>

        <h5>📊 Assessment Strategy:</h5>
        <ul>
            <li>Weekly formative assessments (30%)</li>
            <li>Mid-term project (25%)</li>
            <li>Final capstone project (35%)</li>
            <li>Peer collaboration and participation (10%)</li>
        </ul>

        <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <strong>🚀 Next Steps:</strong> Expand individual weeks into daily sessions with detailed activities, props, and assessments. Each session includes interactive elements, real-world applications, and engagement strategies.
        </div>

        <div style="background: #fef3c7; padding: 10px; border-radius: 8px; margin-top: 15px; font-size: 0.9em;">
            <strong>📊 Generation Stats:</strong> Content safety score: ${Math.round(outputModeration.confidence * 100)}% | Generated: ${new Date().toLocaleString()}
        </div>
        `;

        document.getElementById('loadingDiv').style.display = 'none';
        document.getElementById('curriculumOutput').style.display = 'block';
        document.getElementById('generatedContent').innerHTML = curriculum;

        // Update step indicator
        document.querySelectorAll('.step')[2].classList.add('active');
        
        // Show success message
        showSuccess('Curriculum generated successfully and verified for educational appropriateness!');

        // Log successful generation (in production, send to analytics)
        console.log('Curriculum generated successfully:', {
            subject: data.subject,
            timestamp: new Date().toISOString(),
            safetyScore: outputModeration.confidence
        });

    } catch (error) {
        console.error('Curriculum generation failed:', error);
        document.getElementById('loadingDiv').style.display = 'none';
        showError('Failed to generate curriculum: ' + error.message);
    }
}

function expandWeek() {
    alert('🔥 Feature Preview: This would expand Week 1 into 3-4 detailed daily sessions with specific activities, props, timing, and assessments. Full version includes drag-and-drop session builder!');
}

function generateDaily() {
    alert('📚 Feature Preview: This would break down a single day into 4-6 segments (20-40 minutes each) with specific learning outcomes, required materials, and engagement strategies. Ready for immediate classroom use!');
}
