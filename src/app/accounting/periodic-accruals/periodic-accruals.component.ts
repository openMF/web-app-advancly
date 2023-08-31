/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../accounting.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { indexOf } from 'lodash';
/**
 * Periodic accruals component.
 */
@Component({
  selector: 'mifosx-periodic-accruals',
  templateUrl: './periodic-accruals.component.html',
  styleUrls: ['./periodic-accruals.component.scss']
})
export class PeriodicAccrualsComponent implements OnInit {

  /** Minimum accrue date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum accrue date allowed. */
  maxDate = new Date();
  /** Periodic accruals form. */
  periodicAccrualsForm: FormGroup;
  /** Products Type*/
  productsType = ['Deposit', 'Loan']

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
    private accountingService: AccountingService,
    private settingsService: SettingsService,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private router: Router) { }

  /**
   * Creates periodic accruals form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createPeriodicAccrualsForm();
  }

  /**
   * Creates periodic accruals form.
   */
  createPeriodicAccrualsForm() {
    this.periodicAccrualsForm = this.formBuilder.group({
      'tillDate': ['', Validators.required],
      'productsType': [1]
    });
  }

  /**
   * Submits the periodic accruals form and executes periodic accruals,
   * if successful redirects to accounting.
   */
  submit() {
    const productsType = this.periodicAccrualsForm.value.productsType;
    this.periodicAccrualsForm.removeControl('productsType');

    const periodicAccruals = this.periodicAccrualsForm.value;
    
    // TODO: Update once language and date settings are setup
    periodicAccruals.locale = this.settingsService.language.code;
    periodicAccruals.dateFormat = this.settingsService.dateFormat;
    if (periodicAccruals.tillDate instanceof Date) {
      periodicAccruals.tillDate = this.dateUtils.formatDate(periodicAccruals.tillDate, this.settingsService.dateFormat);
    }

    if (productsType === 1){
      this.accountingService.executePeriodicDepositAccruals(periodicAccruals).subscribe(() => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
    }

    if (productsType === 2){
      this.accountingService.executePeriodicLoanAccruals(periodicAccruals).subscribe(() => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
    }
  }

}
