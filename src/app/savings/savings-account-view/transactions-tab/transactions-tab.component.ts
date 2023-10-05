/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Transactions Tab Component.
 */
@Component({
  selector: 'mifosx-transactions-tab',
  templateUrl: './transactions-tab.component.html',
  styleUrls: ['./transactions-tab.component.scss']
})
export class TransactionsTabComponent implements OnInit {

  /** Savings Account Status */
  status: any;
  /** Transactions Data */
  transactions: any;
  /** Temporary Transaction Data */
  tempTransactions: any;
  /** Form control to handle accural parameter */
  hideAccrualsParam: FormControl;
  /** Columns to be displayed in transactions table. */
  displayedColumns: string[] = ['id', 'date', 'transactionType', 'debit', 'credit', 'balance', 'actions'];
  /** Data source for transactions table. */
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  accountWithTransactions = false;

  /**
   * Retrieves savings account data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute,
              private router: Router) {
    this.route.parent.parent.data.subscribe((data: { savingsAccountData: any }) => {
      this.transactions = data.savingsAccountData.transactions?.filter((transaction: any) => !transaction.reversed);
      this.tempTransactions = this.transactions;
      this.status = data.savingsAccountData.status.value;
    });
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.transactions);
    this.accountWithTransactions = (this.transactions && this.transactions.length > 0);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.tempTransactions.forEach((element: any) => {
      if (this.isAccrual(element.transactionType)) {
        this.tempTransactions = this.removeItem(this.tempTransactions, element);
      }
    });
    this.hideAccrualsParam = new FormControl(false);
  }

  hideAccruals() {
    if (!this.hideAccrualsParam.value) {
      this.dataSource = new MatTableDataSource(this.tempTransactions);
    } else {
      this.dataSource = new MatTableDataSource(this.transactions);
    }
  }

  removeItem(arr: any, item: any) {
    return arr.filter((f: any) => f !== item);
  }

  transactionColor(transaction: any): string {
    if (transaction.isReversal) {
      return 'strike';
    }
    if (this.isAccrual(transaction.transactionType)) {
      return 'accrual';
    }
    return '';
  }

  private isAccrual(transactionType: any): boolean  {
    return (transactionType.accrual || transactionType.code === 'savingsAccountTransactionType.accrual');
  }

  /**
   * Checks if transaction is debit.
   * @param {any} transactionType Transaction Type
   */
  isDebit(transactionType: any) {
    return transactionType.withdrawal === true || transactionType.feeDeduction === true
            || transactionType.overdraftInterest === true || transactionType.withholdTax === true;
  }

  /**
   * Checks transaction status.
   */
  checkStatus() {
    if (this.status === 'Active' || this.status === 'Closed' || this.status === 'Transfer in progress' ||
       this.status === 'Transfer on hold' || this.status === 'Premature Closed' || this.status === 'Matured') {
      return true;
    }
    return false;
  }

  /**
   * Show Transactions Details
   * @param transactions Transactions Data
   */
  showTransactions(transactions: any) {
    if (transactions.transfer) {
      this.router.navigate([`account-transfers/account-transfers/${transactions.transfer.id}`], { relativeTo: this.route });
    } else {
      this.router.navigate([transactions.id, 'general'], { relativeTo: this.route });
    }
  }

  /**
   * Stops the propagation to view pages.
   * @param $event Mouse Event
   */
  routeEdit($event: MouseEvent) {
    $event.stopPropagation();
  }

}
