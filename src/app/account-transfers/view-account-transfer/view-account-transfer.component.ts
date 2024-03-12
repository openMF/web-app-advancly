/** Angular Imports */
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountTransfersService } from '../account-transfers.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'mifosx-view-account-transfer',
  templateUrl: './view-account-transfer.component.html',
  styleUrls: ['./view-account-transfer.component.scss']
})
export class ViewAccountTransferComponent {

  viewAccountTransferData: any;
  /**
   * Retrieves the view account transfer data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Location} location Location.
   */
  constructor(private route: ActivatedRoute,
    private location: Location,
    private accountTransfersService: AccountTransfersService,
    public dialog: MatDialog,
    private translateService: TranslateService) {
    this.route.data.subscribe((data: { viewAccountTransferData: any }) => {
      this.viewAccountTransferData = data.viewAccountTransferData;
    });
  }

  transferToClient(toClient: any): string {
    return `/#/clients/${toClient.id}`;
  }

  transferToAccount(toClient: any, toAccount: any): string {
    return `/#/clients/${toClient.id}/savings-accounts/${toAccount.id}`;
  }

  goBack(): void {
    this.location.back();
  }

  undoTransaction(): void {
    const undoTransactionAccountDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { heading: this.translateService.instant('labels.heading.Undo Transaction'), dialogContext: 
        this.translateService.instant('labels.dialogContext.Are you sure you want undo the transaction') + `${this.viewAccountTransferData.id}` }
    });
    undoTransactionAccountDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        this.accountTransfersService.adjustAccountTransfer(this.viewAccountTransferData.id, {}).subscribe((response: any) => {
          console.log(response);
          this.goBack();
        });
      }
    });
  }

  transactionColor(): string {
    return this.viewAccountTransferData.reversed ? 'undo' : 'active';
  }

}
