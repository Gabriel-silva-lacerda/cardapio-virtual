export function mapPaymentStatus(collectionStatus: string): string {
    switch (collectionStatus) {
      case 'approved':
        return 'approved';
      case 'pending':
        return 'pending';
      case 'failure':
        return 'failure';
      default:
        return 'pending';
    }
  }

