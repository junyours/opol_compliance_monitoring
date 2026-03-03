<?php

namespace App\Mail;

use App\Models\InspectionResult;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InspectionReportMail extends Mailable
{
    use Queueable, SerializesModels;

    public $inspectionResult;
    public $pdfPath;
    public $subject;
    public $message;

    public function __construct(
        InspectionResult $inspectionResult,
        string $pdfPath,
        string $subject,
        string $message
    ) {
        $this->inspectionResult = $inspectionResult;
        $this->pdfPath = $pdfPath;
        $this->subject = $subject;
        $this->message = $message;
    }

    public function envelope()
    {
        return new Envelope(
            subject: $this->subject
        );
    }

    public function content()
    {
        return new Content(
            view: 'emails.inspection-report',
            with: [
                'inspectionResult' => $this->inspectionResult,
                'customMessage' => $this->message
            ]
        );
    }

    public function attachments()
    {
        return [
            Attachment::fromPath($this->pdfPath)
                ->as('inspection-report-' . $this->inspectionResult->id . '.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
